tar -cvf data.tar public/models
brotli data.tar
echo $KEYS | gpg --batch --passphrase-fd 0 --symmetric --output data.tar.br.gpg data.tar.br