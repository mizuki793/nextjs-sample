import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadSchemaSync } from "@graphql-tools/load";
import { addResolversToSchema } from "@graphql-tools/schema";
import { ApolloServer } from "apollo-server-micro";
import Cors from "micro-cors";

import { createContext } from "@/graphql/context";
import { resolvers } from "@/graphql/resolves";
import { IncomingMessage } from "http";

const cors = Cors();

const schema = loadSchemaSync('src/generated/schema.graphql', {
  loaders: [ new GraphQLFileLoader()]
})

const schemaWithResolvers = addResolversToSchema({
  schema,
  resolvers
})

const appolloServer = new ApolloServer({
  schema: schemaWithResolvers,
  context: createContext,
})

const startServer: Promise<void> = appolloServer.start();

export default cors(async function handler(req,res) {
  if(req.method === "OPTIONS") {
    res.end()
    return false
  }
  await startServer
  await appolloServer.createHandler({ path:'/api/graphql'})(req, res)
})

export const config = {
  api:{
    bodyParser: false,
  },
}