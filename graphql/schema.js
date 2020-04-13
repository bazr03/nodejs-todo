const { buildSchema } = require("graphql");

module.exports = buildSchema(`

    type User{
        _id: ID!
        name: String!
        lastName: String!
        email: String!
        password: String!
        projects: [Project!]!
        todos: [ToDo!]!
    }
    type ToDo {
        _id: ID!
        name: String!
        completed: Boolean!
        project: Project!
        createdAt: String!
        updatedAt: String!
    }
    type AuthData {
        token: String!
        name: String!
        lastName: String!
        _id: String!
    }

    type AuthUser {
        name: String!
        lastName: String!
        _id: String!
    }
    type Project {
        _id: ID!
        title: String!
        todos: [ToDo!]!
        createdAt: String!
        updatedAt: String!
    }
    type ProjectData {
        projects: [Project!]!
        totalProjects: Int!
    }

    type toDoData {
        toDos: [ToDo!]!
    }

    type Query {
        getProjects: ProjectData!
        getToDos(projectId: ID!): toDoData
        login(email: String!, password: String!): AuthData!
        User: AuthUser!
    }    

    type Mutation {
        createProject(title: String!) : Project!
        deleteProject( projectId: ID!): Boolean
        createUser(name: String!, lastName:String!, email: String!, password: String): AuthData!
        createToDo(name: String!, completed: Boolean, projectId: ID!): ToDo!
        deleteToDo(toDoId: ID!, projectId: ID!): Boolean
        updateToDo(name: String, completed: Boolean, toDoId: ID!, projectId: ID!  ): ToDo!
    }

    schema {
            query: Query
            mutation: Mutation
        }
`);
