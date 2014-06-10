#!/bin/bash
export PLATFORMS="android ios"
rm -rf CCAHarness
./createproject.sh CCAHarness "$@"
