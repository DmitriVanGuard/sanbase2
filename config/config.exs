# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :sanbase,
  ecto_repos: [Sanbase.Repo]

# Configures the endpoint
config :sanbase, SanbaseWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "Vq7Rfo0T4EfiLX2/ryYal3O0l9ebBNhyh58cfWdTAUHxEJGu2p9u1WTQ31Ki4Phj",
  render_errors: [view: SanbaseWeb.ErrorView, accepts: ~w(json)],
  pubsub: [name: Sanbase.PubSub,
           adapter: Phoenix.PubSub.PG2]


config :sanbase, node_server: "http://localhost:3000"

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :ex_admin,
  repo: Sanbase.Repo,
  module: SanbaseWeb,    # MyProject.Web for phoenix >= 1.3.0-rc
  modules: [
    Sanbase.ExAdmin.Dashboard,
    Sanbase.ExAdmin.Model.Project,
    Sanbase.ExAdmin.Model.LatestCoinmarketcapData,
    Sanbase.ExAdmin.Model.LatestEthWalletData,
    Sanbase.ExAdmin.Model.LatestBtcWalletData,
    Sanbase.ExAdmin.Model.ProjectBtcAddress,
    Sanbase.ExAdmin.Model.ProjectEthAddress,
    Sanbase.ExAdmin.Model.TrackedBtc,
    Sanbase.ExAdmin.Model.TrackedEth,
  ],
  basic_auth: [
    username: {:system, "ADMIN_BASIC_AUTH_USERNAME"},
    password: {:system, "ADMIN_BASIC_AUTH_PASSWORD"},
    realm:    {:system, "ADMIN_BASIC_AUTH_REALM"}
  ]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"

config :xain, :after_callback, {Phoenix.HTML, :raw}