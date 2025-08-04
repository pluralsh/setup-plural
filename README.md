# setup-plural Github Action

Github action to install and configure the plural CLI and local authentication.  Can be used to use the CLI in github actions workflows, or to provide the auth information for subsequent plural-related github actions like `pluralsh/trigger-pull-request` or `pluralsh/trigger-pipeline`.

## Inputs

```yaml
email:
  description: The user email to log in with via OIDC federated credential. This is the preferred and most secure method of authentication
  required: false
consoleToken:
  description: 'Plural Console authentication token'
  required: false
consoleUrl:
  description: 'Plural Console endpoint'
  required: false
config: # this is going to be deprecated, and only relevant for authenticating to app.plural.sh, not an individual Plural Console instance.
  description: Plural CLI Config File (you should prefer using OIDC federated credentials for authentication)
  required: false
vsn:
  description: the plural cli version to use
  required: false
  default: '0.12.14'
plat:
  description: the cli platform to specify
  required: false
  default: 'amd64'
```

## Example Usage

```yaml
- name: Authenticate
  id: plural
  uses: pluralsh/setup-plural@v2
  with:
    consoleUrl: https://my.console.cloud.plural.sh
    email: someone@example.com # the email bound to your OIDC federated credentials
```

## Federated Credentials

If you want to authenticate to a Plural Console instance from Github Actions, we strongly recommend you utilize federated credentials.  These have the following benefits:

1. Don't require you to configure any secrets which contain auth tokens
2. Guaranteed short-lifespan tokens
3. Can configured additional scopes for what the action can actually do.  If you use the `pullRequest` scope it can only trigger plural pr automations for instance.

This not only makes the integration much more secure, it's also frankly easier to manage, especially at scale since you don't need to worry about burdens like secret management and rotation.

Here's a basic example:

```yaml
apiVersion: deployments.plural.sh/v1alpha1
kind: FederatedCredential
metadata:
  name: gh-actions
spec:
  issuer: https://token.actions.githubusercontent.com
  user: someone@example.com # the user you want the federated credential to bind to.
  scopes:
    - createPullRequest
  claimsLike:
  # repo:pluralsh/console:ref:refs/heads/genstage-stack-gs-reconciler
    sub: "repo:pluralsh/console:ref:refs/heads/main
```