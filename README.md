<h1 align="center">Paintbot in Deno</h1>
<h3 align="center" style="font-style: italic;">Why not :)</h3>

<br>

Paintbot game at [tatut/paintbots](https://github.com/tatut/paintbots)

Run game server with:

```bash
docker run -p 31173:31173 antitadex/paintbots:latest
```

Developed with `deno 1.33.3`.

Set server endpoint with an environment variable:

```bash
export PAINTBOTS_URL="http://localhost:31173"
```

Run bot with:

```bash
deno task start
```

Other tasks:

```bash
deno task lint

deno task fmt
```

## Problems with registering the bot?

If you restart the local Paintbots server (or if the cloud server is restarted), you will need to re-register the bot.
In that case, remove the [src/botConfig.cfg](src/botConfig.cfg) file to re-register the next time you run the bot
script (though, bot should remove the file after each execution). You can also rename the bot by
editing [src/index.ts](src/index.ts) file.
