defmodule SanbaseWeb.Graphql.Resolvers.PostResolver do
  require Logger

  import Ecto.Query

  alias Sanbase.Auth.User
  alias Sanbase.Voting.{Poll, Post, Vote}
  alias Sanbase.Repo
  alias Sanbase.InternalServices.Ethauth
  alias SanbaseWeb.Graphql.Resolvers.Helpers

  @preloaded_assoc [:votes, :user, :related_projects, :images]

  def post(_root, %{id: post_id}, _resolution) do
    case Repo.get(Post, post_id) do
      nil -> {:error, "There is no post with id #{post_id}"}
      post -> {:ok, post}
    end
  end

  def all_posts(_root, _args, _context) do
    posts =
      Post
      |> Repo.all()
      |> Repo.preload(@preloaded_assoc)

    {:ok, posts}
  end

  def all_posts_for_user(_root, %{user_id: user_id}, _context) do
    query =
      from(
        p in Post,
        where: p.user_id == ^user_id
      )

    posts =
      query
      |> Repo.all()
      |> Repo.preload(@preloaded_assoc)

    {:ok, posts}
  end

  def all_posts_user_voted(_root, %{user_id: user_id}, _context) do
    query =
      from(
        p in Post,
        where: fragment("? IN (SELECT post_id FROM votes WHERE user_id = ?)", p.id, ^user_id)
      )

    posts =
      query
      |> Repo.all()
      |> Repo.preload(@preloaded_assoc)

    {:ok, posts}
  end
end
