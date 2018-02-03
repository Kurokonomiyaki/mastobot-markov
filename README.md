### What is it?

A bot that collects toots from a Mastodon account, builds a markov-chain model and generates sentences.

### How to deploy on your server

0. Install node: https://nodejs.org/en/download/package-manager

1. Clone the repository and install production dependencies using npm

    ```bash
    git clone https://github.com/Kurokonomiyaki/mastobot-markov.git
    cd mastobot-markov
    npm install --production
    ```

2. Get tokens for your bot

    You need tokens both for the source account (the account from which the toots are collected) and the destination account (the account used by the bot to toot).

    Run the script and then follow the instructions:
    ```bash
    npm run token
    ```

3. Configure the bot

    Copy the `edit-these-settings.json` file into `settings.json`.

    ```bash
    cp edit-these-settings.json settings.json
    ```

    Edit `settings.json` and set the instance urls and access tokens. For knowing your account id, you need to go to your profile page while being logged and watch the end of the url, e.g., https://my.instance/web/accounts/`<your account id is here>`.

4. Run the bot

    You can run the bot directly using `node`.

    ```bash
    node compiled/index.js
    ```

    You should create a service for the bot. You can use `mastobot-markov.service` as a template for a systemd service.
    Read [this documentation](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/system_administrators_guide/sect-managing_services_with_systemd-unit_files) about systemd service files.

### How to use the bot once deployed?

When the bot is launched, it collects the new toots since the last execution (this operation can take a lot of time, especially the first time you launch the bot). The collected sentences are stored at the end of the `sentences.dat` file. You can edit this file manually if you want to add custom sentences, or you can delete the whole file if you want the bot to recollect all your toots.

Once the toots are collected, the bot updates its model file (`model.json`). If for some reasons you want the bot to recompute the full model, simply delete this file.

Once everything is updated, the bot will toot randomly (the time interval can be customized in the `settings.json` file).

### How to update the toots database?

For now, the bot does not update automatically. You need to restart it for triggering updates. If you configured a systemd service:

```bash
systemctl restart mastobot-markov
```
