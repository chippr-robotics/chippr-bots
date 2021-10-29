while IFS= read -r line
do
  curl  --request GET  --url 'https://api.opensea.io/api/v1/assets?owner='$line'&order_direction=desc&offset=0&limit=20' | jq -o cache/$line.json
done < "$1"
