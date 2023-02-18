#!/usr/bin/env bash

cd ${SRC}

vsce login ${PUBLISHER_NAME}

vsce publish
