# Sync .env file with Bitwarden

## install bitwarden cli

### npm

```ps1
npm install -g @bitwarden/cli
```

### native linux

```sh
curl -L 'https://bitwarden.com/download/?app=cli&platform=linux' -o bitwarden-cli.tar.gz
tar -xzf bitwarden-cli.zip
sudo mv bw /usr/local/bin/
```

## create a new item in bitwarden with the content of the .env file

```ps1
$item_id = "learn-games-project-env"
$env_content = Get-Content .env -Raw
$item = @{type=2;secureNote=@{type=0};name=$item_id;notes=$env_content} | ConvertTo-Json
$base64_item = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($item))
bw create item $base64_item
```

## retrieve the content of the item and write it to a .env file

```ps1
$item_id = "learn-games-project-env"
$item = bw get item $item_id | ConvertFrom-Json
$env_content = $item.notes
Set-Content -Path .env -Value $env_content
```

### on linux or macos

```sh
item_id="learn-games-project-env"
bw get notes $item_id > .env

cat .env
```
