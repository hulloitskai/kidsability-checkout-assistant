# kidsability-checkout-assistant

_A Chrome extension + web service that makes it easier to make equipment
reservations._

<p align="center">
  <img src="./docs/demo.gif" width="640px" />
</p>

> Built as a prototype for a project team from
> [UW GreenHouse](https://uwaterloo.ca/stpauls/greenhouse) working
> to improve the equipment checkout flow at
> [KidsAbility](https://www.kidsability.ca).

## Architecture

- [`extension`](./extension) - Chrome extension that automates checkouts
  for [L4U](https://www.powerschool.com/l4u/), a library service
  that KidsAbility uses to manage healthcare equipment rentals.

- [`client`](./client) – Web service frontend; where equipment QR codes
  point to.

- [`server`](./server) – Relay server; relays checkout requests from the
  `client` to the `extension`.
