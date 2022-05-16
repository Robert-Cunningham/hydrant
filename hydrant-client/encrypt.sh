tar -cvf data.tar public/models
brotli data.tar
echo $CRYPTO_KEY | gpg --batch --passphrase-fd 0 --symmetric data.tar.br