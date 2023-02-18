#!/usr/bin/env bash

############################################################################
# ZSH SETUP
############################################################################

git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
sed -i '/plugins=(git)/c\plugins=(git kubectl zsh-autosuggestions gcloud)' ~/.zshrc

############################################################################
# ADMIN:CORE-CMD DEV SETUP
############################################################################

cd ${SRC}
npm install --loglevel=error --global >/dev/null
npm install vsce --loglevel=error --global >/dev/null

# ############################################################################
# # DVC-COMNMAND SETUP FOR LOCAL DEVELOPMENT
# ############################################################################

cat <<EOT >>~/.zshrc
    alias run="${SRC}/src/bin/cmd.mjs"
EOT
