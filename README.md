# wok, a webhook server

Wok is a relatively small, simple Node.js server that listens
to HTTP requests and acts upon them, configured by simple rules.

Basically, if you want a Github `push` event to trigger something
custom, **wok** is your dish:

```toml
[update-when-master-hit]
match-url = "^/mysecretgithubwebhook/"
match-method = "POST"
cwd = "/home/myapp"
run = "git pull && pkill -f HUP myserver"
```

## Invocation

Simply running `npm start` will have `wok` up and running
reading rule TOML files from `./rules` and listening to
the arbitrarily chosen port 9400.

You can customize those values with environment variables:

* `WOK_PORT` - HTTP port number
* `WOK_DIRS` - directory trees to look in for TOML files.
               Separated by your platform's path delimiter; a
               colon on Unixy systems and a semicolon on
               Windows boxes.
               
## Rules

Rule files are [TOML].

Each rule must be in a TOML table (section if you're used to INIs as I am).

Wok will watch for changes in the directories declared and automatically reload
rule files as they change.

The supported directives can be broadly divided into two kinds, **match** and **action**.

If multiple rules match a request, _all of them are run_.

### Match directives

* `match-url`: A regular expression to match against the URL.
               This is unanchored, so you might want to do something like
               `^/foo/` to match all URLs starting with `/foo/`.
* `match-method`: Case-insensitively match the HTTP method.
* `match-body`/`match-query`: complex match against POST body elements and query strings
                              (so-called GET parameters).
                              
#### Match-body/match-query

Match-body and match-query support structured queries with regexps, substring comparisons
and negation. A simplified string format is also available (the first example), where the
part before the equality sign maps to the `key` and the part after to the `value`.

When multiple match rules are given, all of them must match.

```toml
match-body = [
    "repository.full_name=valohai/wok",
    {key = "foo", regexp = "^.+asd.+$"},
]
```

The supported arguments for a complex match are:

* `key`: the dot-separated path to the value to match. This uses [`_.get`][ldget] under the
         hood, so the semantics there apply.
* `negate`: whether this match should _not_ match.

The following are mutually exclusive, naturally.

* `equals`: a string value the given key must match.
* `contains`: a string value the given key must contain.
* `regexp`: a regexp the given key must match.

### Action directives

* `run`: (string) the shell command to run when the rule is matched.
         See below for further details about the environment.
* `input`: (boolean) if true, the `run` command will be fed the body of the
           HTTP request (if any) into its stdin stream.
* `output`: (boolean) if true, the output of the command will be returned
            as the HTTP body to the client.
            This may wreak interesting havoc if multiple rules match.
* `throttle`: (integer) optional, seconds to define how scarcely the rule's actions
              may get triggered. An useful, simple anti-spam measure.
* `uid`: (integer/string) if possible, run the command as this uid
* `gid`: (integer/string) if possible, run the command as this gid

### Environment variables

When a `run` directive matches, some additional environment variables are passed to the
child process in a vaguely CGI-like way.

* `WOK_URL`: the (local) URL that triggered the call.
* `WOK_RULE`: the name of the rule. It's debatable whether this is of any use
              whatsoever.
* `WOK_BODY`: if a body is passed (via the `input` directive),
              this will either be `string` or `json`, depending
              on the encoding of the input data.

[TOML]: https://github.com/toml-lang/toml
[ldget]: https://lodash.com/docs/4.16.6#get
