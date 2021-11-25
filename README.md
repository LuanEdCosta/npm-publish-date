# :timer_clock: npm-publish-date

:white_check_mark: See the publish date of NPM packages easily.
:white_check_mark: Validate publish dates to [avoid installing packages with embedded malware](#no_good_man-avoid-installing-packages-with-embedded-malware).
:white_check_mark: List the publish date of installed packages.

## :arrow_down: Installation

Installing globally

```
npm i -g npm-publish-date
```

```
yarn global add npm-publish-date
```

You can also use `npx npm-publish-date <command>` or `yarn create npm-publish-date <command>` to run the CLI just once.

## :ok_hand: Usage

### List

List the publish date of installed packages.

```shell
# Syntax:
# npd list [packages...] [options]

# Arguments:
# [packages...] ➡️ Package names to filter (without scope and version).

# Options:
# -a or --all ➡️ Show the entire package tree.
# -d or --depth <depth> ➡️ Filter packages using its depth in the package tree.
# -j or --json ➡️ Return data in JSON format.

# Example:
npd list express --all
```

### View

See the publish date of any package.

```shell
# Syntax:
# npd view [packages...] [options]

# Arguments:
# [packages...] ➡️ Package names in the format: @scope/package@version

# Options:
# -a or --all ➡️ Show the entire package tree.
# -d or --depth <depth> ➡️ Filter packages using their depth in the package tree.
# -j or --json ➡️ Return data in JSON format.

# Example:
npd view react axios@latest redux@4.1.2 --all
```

### Validate

Validate packages publish date.

```shell
# Syntax:
# npd validate [packages...] [options]

# Arguments:
# [packages...] ➡️ Package names in the format: @scope/package@version

# Options:
# -m or --min-days <minDays> ➡️ Minimum days elapsed since package publication.
# -a or --all ➡️ Validate the entire package tree.
# -d or --depth <depth> ➡️ Filter packages using their depth in the package tree.
# -j or --json ➡️ Return data in JSON format.

# Example:
npd validate eslint redux@latest --all --min-days 2
```

## :no_good_man: Avoid Installing Packages With Embedded Malware

In October and November of 2021 three very popular NPM packages with millions of downloads were published with embedded malware. Infected computers had all the secrets and keys stolen by the malicious code executed with a simple `npm install`.

The good news is that this type of problem is **usually fixed in a few hours**. The bad news is that the hackers probably will do the same again.

This library was created to protect us from getting hacked while installing NPM packages. Just validating the publish date is not the best protection strategy, but it can save our accounts.

Click in the links to see more about:

- [Github Advisories - Embedded malware in ua-parser-js](https://github.com/advisories/GHSA-pjwm-rvh2-c87w)
- [Github Advisories - Embedded malware in rc](https://github.com/advisories/GHSA-g2q5-5433-rhrf)
- [Github Advisories - Embedded malware in coa](https://github.com/advisories/GHSA-73qr-pfmq-6rp8)

## :man: Author

Luan Eduardo da Costa | [Follow me on Linkedin](https://www.linkedin.com/in/luaneducosta/)
