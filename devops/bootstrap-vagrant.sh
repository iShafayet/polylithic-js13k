#!/usr/bin/env bash

apt-get update

curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs

cd /vagrant
npm i

