defmodule Sanbase.Graphql.ProjectApiTest do
  use SanbaseWeb.ConnCase
  use Phoenix.ConnTest

  import Sanbase.Utils, only: [parse_config_value: 1]

  alias Ecto.Changeset
  alias Sanbase.Graphql.ProjectInfo
  alias Sanbase.Model.Project
  alias Sanbase.Model.Ico
  alias Sanbase.Model.Currency
  alias Sanbase.Model.IcoCurrencies
  alias Sanbase.Model.ProjectEthAddress
  alias Sanbase.Model.LatestEthWalletData
  alias Sanbase.Repo

  import Plug.Conn
  import ExUnit.CaptureLog

  defp query_skeleton(query, query_name) do
    %{
      "operationName" => "#{query_name}",
      "query" => "query #{query_name} #{query}",
      "variables" => "{}"
    }
  end

  test "fetch wallet balance for project transparency", context do
    project1 = %Project{}
    |> Project.changeset(%{name: "Project1", project_transparency: true})
    |> Repo.insert!

    addr1_1 = %ProjectEthAddress{}
    |> ProjectEthAddress.changeset(%{project_id: project1.id, address: "abcdefg", project_transparency: true})
    |> Repo.insert!

    addr1_1_data = %LatestEthWalletData{}
    |> LatestEthWalletData.changeset(%{address: "abcdefg", update_time: Ecto.DateTime.utc(), balance: 500})
    |> Repo.insert!

    addr1_2 = %ProjectEthAddress{}
    |> ProjectEthAddress.changeset(%{project_id: project1.id, address: "rrrrr"})
    |> Repo.insert!

    addr1_2_data = %LatestEthWalletData{}
    |> LatestEthWalletData.changeset(%{address: "rrrrr", update_time: Ecto.DateTime.utc(), balance: 800})
    |> Repo.insert!

    query = """
    {
      allProjects(onlyProjectTransparency:true) {
        name,
        btcBalance,
        ethBalance
      }
    }
    """

    result =
    context.conn
    |> put_req_header("authorization", get_authorization_header())
    |> post("/graphql", query_skeleton(query, "allProjects"))

    assert json_response(result, 200)["data"]["allProjects"] == [%{"name" => "Project1", "btcBalance" => nil, "ethBalance" => "500"}]
  end

  test "fetch funds raised from icos", context do
    currency1 = %Currency{}
    |> Currency.changeset(%{code: "ETH"})
    |> Repo.insert!

    currency2 = %Currency{}
    |> Currency.changeset(%{code: "BTC"})
    |> Repo.insert!

    project1 = %Project{}
    |> Project.changeset(%{name: "Project1"})
    |> Repo.insert!

    ico1 = %Ico{}
    |> Ico.changeset(%{project_id: project1.id, funds_raised_usd: 123.45})
    |> Repo.insert!

    project2 = %Project{}
    |> Project.changeset(%{name: "Project2"})
    |> Repo.insert!

    ico2_1 = %Ico{}
    |> Ico.changeset(%{project_id: project2.id, funds_raised_usd: 100})
    |> Repo.insert!

    ico2_2 = %Ico{}
    |> Ico.changeset(%{project_id: project2.id, funds_raised_usd: 200})
    |> Repo.insert!

    ico_currency_2_1 = %IcoCurrencies{}
    |> IcoCurrencies.changeset(%{ico_id: ico2_1.id, currency_id: currency1.id, amount: 50})
    |> Repo.insert!

    ico_currency_2_2 = %IcoCurrencies{}
    |> IcoCurrencies.changeset(%{ico_id: ico2_1.id, currency_id: currency2.id, amount: 300})
    |> Repo.insert!

    query = """
    {
      allProjects {
        name,
        fundsRaisedIcos {
          amount,
          currencyCode
        }
      }
    }
    """

    result =
    context.conn
    |> put_req_header("authorization", get_authorization_header())
    |> post("/graphql", query_skeleton(query, "allProjects"))

    assert json_response(result, 200)["data"]["allProjects"] ==
      [%{"name" => "Project1", "fundsRaisedIcos" =>
        [%{"currencyCode" => "USD", "amount" => "123.45"}]},
      %{"name" => "Project2", "fundsRaisedIcos" =>
        [%{"currencyCode" => "BTC", "amount" => "300"},
          %{"currencyCode" => "ETH", "amount" => "50"},
          %{"currencyCode" => "USD", "amount" => "200"}]}]
  end

  defp get_authorization_header do
    username = context_config(:basic_auth_username)
    password = context_config(:basic_auth_password)

    "Basic " <> Base.encode64(username <> ":" <> password)
  end

  defp context_config(key) do
    Application.get_env(:sanbase, SanbaseWeb.Graphql.ContextPlug)
    |> Keyword.get(key)
    |> parse_config_value()
  end
end
