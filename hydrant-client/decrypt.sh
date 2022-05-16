sudo apt update && sudo apt install brotli gnupg
echo $KEYS | gpg --batch --passphrase-fd 0 data.tar.br.gpg
brotli --decompress data.tar.br
tar -xvf data.tar