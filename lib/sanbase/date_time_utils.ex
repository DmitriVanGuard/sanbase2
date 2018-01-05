defmodule Sanbase.DateTimeUtils do
  def seconds_ago(seconds) do
    DateTime.utc_now()
    |> DateTime.to_unix()
    |> Kernel.-(seconds)
    |> DateTime.from_unix!
  end

  def minutes_ago(minutes) do
    seconds_ago(minutes * 60)
  end

  def hours_ago(hours) do
    seconds_ago(hours * 60 * 60)
  end

  def days_ago(days) do
    seconds_ago(days * 60 * 60 * 24)
  end

  def ecto_date_to_datetime(ecto_date) do
    {:ok, datetime, _} = Ecto.Date.to_iso8601(ecto_date) <> "T00:00:00Z" |> DateTime.from_iso8601()
    datetime
  end
end
