import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.

=========================================================================*/
const schema = a.schema({ 

  UserProfile: a.model({   
    birth_date: a.date(),
    username: a.string().required(),
    locale: a.json().required(),
    bio: a.string(),
    interests: a.string(),
    gender: a.ref("Gender"),
    lastname: a.string(),
    firstname: a.string(),
    owner: a.string().authorization(allow => [allow.owner().to(['read', 'delete'])]),
    app_theme: a.ref("AppTheme"),
    profile_theme: a.ref("ProfileTheme")
  })
  .authorization((allow) => [
    allow.publicApiKey().to(["read"]), 
    allow.owner()
  ]),

  Newsletter: a.model({   
    email_address: a.email(),
  })
  .authorization((allow) => [
    allow.publicApiKey(), 
    allow.groups(["Guest", "Member"])
  ]),
  
  SpaceTypeEnum: a.enum([
    'HOME',
    'BUSINESS',
    'GROUP'
  ]),

  PrivacyLevelEnum: a.enum([
    'PRIVATE',
    'FRIENDS_ONLY',
    'PUBLIC',
    'INVITE_ONLY'
  ]),

  FriendshipStatusEnum: a.enum([
    'FRIENDS',
    'NOT_FRIENDS',
    'BLOCKED',
  ]),

  RequestStatusEnum: a.enum([
    'NEW',
    'ACCEPTED',
    'CANCELED',
    'DENIED',
  ]),

  PollTypeEnum: a.enum([
    'TRUE_FALSE',
    'AGREE_DISAGREE',
    'OPEN_TEXT',
    'MULTIPLE_CHOICE',
  ]),

  Gender: a.enum([
    'SHE/HER',    
  ]),

  AppTheme: a.enum([
    'LIGHT',
    'DARK',
  ]),

  ProfileTheme: a.enum([
    'SYSTEM',
    'TANGERINE',
  ]),
 
  Todo: a
    .model({
      content: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
