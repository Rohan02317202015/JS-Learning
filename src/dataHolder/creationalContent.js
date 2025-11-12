export const contentMap = {
      Singleton: {
        concept: 'The Singleton Pattern is a creational design pattern that ensures only one instance of a class or object exists throughout the entire lifecycle of an application. It provides a single, global point of access to that instance. This is especially useful when exactly one object is needed to coordinate actions across the system — such as configuration managers, logging systems, or database connections.In JavaScript, the Singleton pattern is often implemented using closures, modules, or ES6 classes. Since JavaScript allows flexible object creation, this pattern helps prevent accidental multiple instantiations that could lead to inconsistent states or excessive resource use.',
        application: [
            'A private constructor (or encapsulated initialization logic) that prevents direct instantiation',
            'A static method or mechanism to access the single instance. Keeping a shared service, like a network manager or analytics tracker.',
            'Internal logic that creates the instance only once and returns it for all future calls.'
        ],
        example: '/src/creational/singleton/example.html',
        snippetPath: 'src/creational/singleton/definition.js'
      },
      Factory: {
        concept: 'The Factory Pattern is a creational design pattern that provides an interface for creating objects in a superclass, but allows subclasses (or logic inside the factory) to alter the type of objects that will be created. Instead of instantiating objects directly using new, you delegate the creation process to a factory function or class.This pattern promotes loose coupling by separating the object creation logic from the client code.',
        application: [
            'Dynamically generate UI components like buttons, inputs, modals, etc',
            'Choose the right database driver (MySQL, MongoDB, PostgreSQL) at runtime.',
            'Generate service clients for different APIs (REST, GraphQL, SOAP)',
            'Instantiate strategies or modules dynamically based on configuration.'
        ],
        example: '/src/creational/factory/example.html',
        snippetPath: 'src/creational/factory/definition.js'
      }
    };
