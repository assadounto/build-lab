Rails.application.routes.draw do
  get "/health", to: "health#show"

  namespace :api do
    namespace :v1 do
      post "session", to: "sessions#create"
      delete "session", to: "sessions#destroy"
      get "me", to: "sessions#show"
      resources :projects, only: %i[index create show] do
        resources :milestones, only: %i[update]
        resources :log_entries, only: %i[create]
      end
    end
  end
end
