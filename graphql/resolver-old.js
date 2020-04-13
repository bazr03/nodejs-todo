const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// require("dotenv").config({ path: "variables.env" });
const Project = require("../models/project");
const User = require("../models/user");
const Todo = require("../models/toDo");

module.exports = {
  /* 
  / CREATE USER FUNCTION
  */
  createUser: async function(
    { name, lastName, email, password },
    { errorName },
    req
  ) {
    const errors = [];

    if (!validator.isEmail(email)) {
      errors.push({ msg: "Email invalido!" });
    }
    if (
      validator.isEmpty(password) ||
      !validator.isLength(password, { min: 5 })
    ) {
      errors.push({
        msg: "Password muy corto, debe tener al menos 5 caracteres!"
      });
    }
    if (validator.isEmpty(name) || !validator.isLength(name, { min: 2 })) {
      errors.push({
        msg: "El nombre debe contener al menos 2 caracteres!"
      });
    }
    if (
      validator.isEmpty(lastName) ||
      !validator.isLength(lastName, { min: 2 })
    ) {
      errors.push({
        msg: "El nombre debe contener al menos 2 caracteres!"
      });
    }
    if (errors.length > 0) {
      const error = new Error("Entrada no valida!");
      error.data = errors;
      error.code = 406;
      throw error;
    }

    const userExist = await User.findOne({ email: email }, { errorName }, req);

    if (userExist) {
      const error = new Error("Un usuario con ese correo ya existe!");
      error.code = 401;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    // const hashedPsw = await bcrypt.hash(password, 12);
    const hashedPsw = await bcrypt.hash(password, salt);

    const user = new User({
      name: name,
      lastName: lastName,
      email: email,
      password: hashedPsw
    });

    const savedUser = await user.save();

    return {
      ...savedUser._doc,
      _id: savedUser._id.toString()
    };
  },
  /* 
  / LOGIN FUNCTION
  */
  login: async function({ email, password }, { errorName }, req) {
    const errors = [];

    if (!validator.isEmail(email)) {
      errors.push({ msg: "Email no valido!" });
    }
    if (validator.isEmpty(password)) {
      errors.push({ msg: "Debes ingresar tu contraseña!" });
    }
    if (errors.length > 0) {
      const error = new Error("Entrada no valida!");
      error.data = errors;
      error.code = 406;
      throw error;
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("User not found!");
      error.code = 401;
      throw error;
    }

    const doesMatch = await bcrypt.compare(password, user.password);
    if (!doesMatch) {
      const error = new Error("Password is incorrect!");
      error.code = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    return {
      token: token,
      name: user.name,
      lastName: user.lastName,
      userId: user._id.toString()
    };
  },
  User: async function({ token }, { errorName }, req) {
    if (!token) {
      const error = new Error("Token no proporcionado");
      error.code = 404;
      throw error;
    }

    console.log("token desde user: ", token);
    let decodedToken;

    try {
      decodedToken = jwt.verify(token, process.env.JWT_KEY);
    } catch (error) {
      console.log(error);
    }

    if (!decodedToken) {
      const error = new Error("Token no valido!");
      error.code = 401;
      throw error;
    }

    return {
      name: decodedToken.name,
      lastName: decodedToken.lastName,
      userId: decodedToken.userId
    };
  },
  /* 
  / CREATE PROJECT FUNCTION
  */
  createProject: async function({ title }, { errorName }, req) {
    // if (!req.isAuth) {
    //   const error = new Error("Not authenticated!");
    //   error.code = 401;
    //   throw error;
    // }
    const errors = [];

    if (validator.isEmpty(title) || !validator.isLength(title, { min: 3 })) {
      errors.push({
        msg: "Titulo no valido, debe tener al menos 3 caracteres!"
      });
    }

    if (errors.length > 0) {
      const error = new Error("Entrada no valida!");
      error.data = errors;
      error.code = 406; // no es estrictamente necesario
      throw error;
    }

    const project = new Project({
      title: title
    });

    const createdProject = await project.save();

    return {
      ...createdProject._doc,
      _id: createdProject._id.toString(),
      createdAt: createdProject.createdAt.toISOString(),
      updatedAt: createdProject.updatedAt.toISOString()
    };
  },
  /* 
  / GET PROJECTS FUNCTION
  */
  getProjects: async function(args, { errorName }, req) {
    // if (!req.isAuth) {
    //   const error = new Error("Not authenticated!");
    //   error.code = 401;
    //   throw error;
    // }
    const totalProjects = await Project.find().countDocuments();
    const projects = await Project.find();

    return {
      projects: projects.map(project => {
        return {
          ...project._doc,
          _id: project._id.toString(),
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString()
        };
      }),
      totalProjects: totalProjects
    };
  },
  /* 
  / CREATE USER FUNCTION
  */
  createToDo: async function(
    { name, completed, projectId },
    { errorName },
    req
  ) {
    if (!req.isAuth) {
      // const error = new Error("Not authenticated!");
      // error.code = 401;
      // throw error;
      throw new Error(errorName.UNAUTHORIZED);
    }
    const errors = [];
    if (validator.isEmpty(name) || !validator.isLength(name, { min: 3 })) {
      errors.push({
        msg: "El nombre de la tarea debe tener al menos 2 caracteres!"
      });
    }
    if (errors.length > 0) {
      const error = new Error("Entrada no valida!");
      error.data = errors;
      error.code = 406; // no es estrictamente necesario
      throw error;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error(
        "Proyecto no encontrado!, varifica ID proporcionado"
      );
      error.code = 401;
      throw error;
    }
    const toDo = new Todo({
      name: name,
      completed: completed,
      project: project
    });

    const savedToDo = await toDo.save();
    await project.todos.push(savedToDo);
    await project.save();

    return {
      ...savedToDo._doc,
      _id: savedToDo._id.toString(),
      createdAt: savedToDo.createdAt.toISOString(),
      updatedAt: savedToDo.updatedAt.toISOString()
    };
  },
  getToDos: async function({ projectId }, { errorName }, req) {
    // if (!req.isAuth) {
    //   const error = new Error("Not authenticated!");
    //   error.code = 401;
    //   throw error;
    // }
    const toDos = await Todo.find({ project: projectId });

    return {
      toDos: toDos.map(toDo => {
        return {
          ...toDo._doc,
          _id: toDo._id.toString(),
          createdAt: toDo.createdAt.toISOString(),
          updatedAt: toDo.updatedAt.toISOString()
        };
      })
    };
  },
  deleteToDo: async function({ toDoId, projectId }, { errorName }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    const toDo = await Todo.findById(toDoId);
    if (!toDo) {
      const error = new Error("No se encuentra ninguna tarea con ese ID!");
      error.code = 404;
      throw error;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error("No existe un proyecto con ese ID!");
      error.code = 404;
      throw error;
    }

    await Todo.findByIdAndRemove(toDoId);
    await project.todos.pull(toDoId);
    await project.save();

    return true;
  },
  updateToDo: async function(
    { name, completed, toDoId, projectId },
    { errorName },
    req
  ) {
    // if (!req.isAuth) {
    //   const error = new Error("Not authenticated!");
    //   error.code = 401;
    //   throw error;
    // }
    const errors = [];
    if (validator.isEmpty(name) || !validator.isLength(name, { min: 2 })) {
      errors.push({
        msg: "El nombre de la tarea debe tener al menos 2 caracteres!"
      });
    }
    if (validator.isEmpty(toDoId)) {
      errors.push({
        msg: "El ID! de la tarea no puede estar vacio!"
      });
    }
    if (validator.isEmpty(projectId)) {
      errors.push({
        msg: "El ID! del proyecto no puede estar vacio!"
      });
    }
    if (errors.length > 0) {
      const error = new Error("Entrada no valida!");
      error.data = errors;
      error.code = 406; // no es estrictamente necesario
      throw error;
    }

    const todo = await Todo.findOne({ _id: toDoId, project: projectId });
    // const todo = await Todo.findById(toDoId);
    if (!todo) {
      const error = new Error("Tarea no encontrada!");
      error.code = 404;
      throw error;
    }

    todo.name = name;
    todo.completed = completed;
    const updatedToDo = await todo.save();

    return {
      ...updatedToDo._doc,
      _id: updatedToDo._id.toString(),
      createdAt: updatedToDo.createdAt.toISOString(),
      updatedAt: updatedToDo.updatedAt.toISOString()
    };
  }
};
