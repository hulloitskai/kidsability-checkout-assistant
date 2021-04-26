use chrono::{DateTime, FixedOffset};
use http::StatusCode;
use log::info;
use logger::init as init_logger;
use std::convert::Infallible;
use tokio;

use anyhow::Context as AnyhowContext;
use anyhow::Result;

use warp::get as warp_get;
use warp::http::Response as HttpResponse;
use warp::path as warp_path;
use warp::path::end as warp_end;
use warp::serve as warp_serve;
use warp::{Filter, Rejection};
use warp_proxy::reverse_proxy_filter as warp_proxy;

use graphql::http::playground_source as graphql_playground_source;
use graphql::http::GraphQLPlaygroundConfig;
use graphql::Request as GraphQLRequest;
use graphql::Schema;

use graphql_warp::graphql as warp_graphql;
use graphql_warp::graphql_subscription as warp_graphql_subscription;
use graphql_warp::BadRequest as BadGraphQLRequest;
use graphql_warp::Response as GraphQLResponse;

mod checkout;
mod env;
mod graph;
mod meta;

use checkout::CheckoutNotifier;
use env::load as load_env;
use graph::{Mutation, Query, Subscription};
use meta::BuildInfo;

#[tokio::main]
async fn main() -> Result<()> {
    // Load environment variables and initialize logger.
    load_env().context("failed to load environment variables")?;
    init_logger();

    // Read build info.
    let timestamp =
        DateTime::<FixedOffset>::parse_from_rfc3339(env!("BUILD_TIMESTAMP"))
            .context("failed to parse build timestamp")?;
    let version = match env!("BUILD_VERSION") {
        "" => None,
        version => Some(version.to_owned()),
    };
    let build_info = BuildInfo {
        timestamp: timestamp.into(),
        version,
    };

    // Build checkout notifier.
    let notifier = CheckoutNotifier::new();

    // Build GraphQL schema.
    let schema = Schema::build(Query, Mutation, Subscription)
        .data(build_info)
        .data(notifier)
        .finish();

    // Build GraphQL filters
    let graphql = warp_graphql(schema.clone()).and_then(
        |(schema, request): (Schema<_, _, _>, GraphQLRequest)| async move {
            Ok::<_, Infallible>(GraphQLResponse::from(
                schema.execute(request).await,
            ))
        },
    );
    let graphql_subscription = warp_graphql_subscription(schema);
    let graphql_playground = warp_get().map(|| {
        let config = GraphQLPlaygroundConfig::new("/api/graphql")
            .subscription_endpoint("/api/graphql");
        let source = graphql_playground_source(config);
        HttpResponse::builder()
            .header("content-type", "text/html")
            .body(source)
    });

    // Build API filter.
    let api = warp_path("api").and(
        warp_end()
            .and(graphql_playground)
            .or(warp_path("graphql").and(graphql_subscription.or(graphql))),
    );

    // Build proxy filter.
    let proxy = warp_proxy("".to_owned(), "http://localhost:8080".to_owned());

    // Build root filter.
    let root = api.or(proxy).recover(|err: Rejection| async move {
        if let Some(BadGraphQLRequest(err)) = err.find() {
            return Ok::<_, Infallible>(warp::reply::with_status(
                err.to_string(),
                StatusCode::BAD_REQUEST,
            ));
        }
        Ok(warp::reply::with_status(
            "internal server error".to_string(),
            StatusCode::INTERNAL_SERVER_ERROR,
        ))
    });

    info!(target: "server", "listening on http://0.0.0.0:3000");
    warp_serve(root).run(([0, 0, 0, 0], 3000)).await;
    Ok(())
}
