// Importa la librería 'mongoose', que es una ODM (Object Data Modeling) para MongoDB en Node.js.
const mongoose = require('mongoose');

// Define una función asíncrona llamada 'connectMongo'. Es asíncrona porque la conexión a una DB toma tiempo.
const connectMongo = async () => {
  try {
    // Intenta conectar a MongoDB usando la URI definida en las variables de entorno (.env).
    // 'await' pausa la ejecución hasta que la conexión se establezca o falle.
    await mongoose.connect(process.env.MONGO_URI);
    
    // Si la conexión es exitosa, imprime este mensaje en la consola.
    console.log('MongoDB conectado');
  } catch (err) {
    // Si ocurre un error durante la conexión, entra aquí e imprime el error en la consola.
    console.error('Error al conectar MongoDB:', err);
  }
};

// Llama a la función 'connectMongo' para iniciar la conexión inmediatamente cuando se importa el archivo.
connectMongo();

// Exporta la función 'connectMongo' para poder usarla en otros archivos si es necesario.
module.exports = connectMongo;