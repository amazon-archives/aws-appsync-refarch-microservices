#!/usr/bin/env bash
set -e
IFS='|'

# if no provided environment name, use default env variable, then user override
if [[ ${ENV} = "" ]];
then
    ENV=${AWS_BRANCH}
fi
if [[ ${USER_BRANCH} != "" ]];
then
    ENV=${USER_BRANCH}
fi

AWSCONFIG="{\
\"configLevel\":\"project\",\
\"useProfile\":true,\
\"profileName\":\"default\"\
}"

AMPLIFY="{\
\"envName\":\"${ENV}\"\
}"

PROVIDERS="{\
\"awscloudformation\":${AWSCONFIG}\
}"

CODEGEN="{\
\"generateCode\":false,\
\"generateDocs\":false\
}"

echo "# Getting Amplify CLI Cloud-Formation stack info from environment cache"
export ORDERAPIINFO="$(envCache --get ORDERAPIINFO)"

echo "# Start initializing Amplify environment: ${ENV}"
if [[ -z ${ORDERAPIINFO} ]];
then
    echo "# Initializing new Amplify environment: ${ENV} (amplify init)"
    amplify init --amplify ${AMPLIFY} --providers ${PROVIDERS} --codegen ${CODEGEN} --yes;
    echo "# Environment ${ENV} details:"
    amplify env get --name ${ENV}
else
    echo "ORDERAPIINFO="${ORDERAPIINFO}
    echo "# Importing Amplify environment: ${ENV} (amplify env import)"
    amplify env import --name ${ENV} --config "${ORDERAPIINFO}" --awsInfo ${AWSCONFIG} --yes;
    echo "# Initializing existing Amplify environment: ${ENV} (amplify init)"
    amplify init --amplify ${AMPLIFY} --providers ${PROVIDERS} --codegen ${CODEGEN} --yes;
    echo "# Environment ${ENV} details:"
    amplify env get --name ${ENV}
fi
    echo "# Done initializing Amplify environment: ${ENV}"


echo "# Store Amplify CLI Cloud-Formation stack info in environment cache"
ORDERAPIINFO="$(amplify env get --json --name ${ENV})"
envCache --set ORDERAPIINFO ${ORDERAPIINFO}
echo "ORDERAPIINFO="${ORDERAPIINFO}

echo "# Export API Endpoint"
export GRAPHQL_ENDPOINT=$(jq -r '.api[(.api | keys)[0]].output.GraphQLAPIEndpointOutput' ./amplify/#current-cloud-backend/amplify-meta.json)


echo "# GRAPHQL Endpoint="${GRAPHQL_ENDPOINT}



