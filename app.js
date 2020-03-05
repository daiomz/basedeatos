//importacion 
var expresss = require ('express');
var app = expresss ();
var mongoose = require('mongoose');//framework de base de datos
var hbs= require('express-handlebars');
var session = require('express-session');

//usa un middlewar 
app.use(session({secret:'fnlaknflknldknfln'}));

//cuando quiero recibir info de un form (middlewar) para que express haga una conversion llama a la funcion express.urlencoder
app.use(expresss.urlencoded({extended:true}));
app.use(expresss.json()); // transforma el json del server en body

//definir handlebars como motor de template 
app.engine('handlebars', hbs());
app.set('view engine', 'handlebars');

//monguse no devuelve una promise per se  TRABAJA CON CALLBACKS, por eso se pone esta funcion qu ese comporta como promise
mongoose.Promise = global.Promise;
 
/////////////////////////////////////////////////


// si es mi pc le pongo localhost

//PROMISE 
    /*mongoose.connect(
    'mongodb://10.5.20.78:27017',
    {useNewUrlParser: true}

 ).then(function) {
     console.log('conectado');
 });
 
 */



 //funcion de la libreria de mongoose para conectar con la base de datos 
 async function conectar () {
    await mongoose.connect  (
    'mongodb://10.128.35.136:27017/curso',
    {useNewUrlParser: true}
     )
     console.log('conectado');
 }
conectar ();


//estructura de lo que quiero guardar // primero armo el schema y dsp el model, solo se trabaja cpon el model
//hay que crear un model o dominioo (algo que voy a poder hacerle crud)


//schema es la estructura de la base de datos un json
const ArtistaSchema = mongoose.Schema ({

    nombre: String,
    apellido: String

})

//model todo aquello que intereactua con una base de datos (nombre de coleccion, estructura)
const ArtistaModel = mongoose.model('Artista', ArtistaSchema);


//schema login






//filtrar por id pongo localhost/bvuscar/numerodeid

/*app.get('/buscar/:id', async function( req , res ) {
   
    var listado = await ArtistaModel.find({_id: req.params.id});
     //res.send('hola mundo');
     res.send(listado);
 });

 
 app.get('/actualizar', async function( req , res ) {
    
    await ArtistaModel.findByIdAndUpdate(
        
        {_id: '5e5709923399ba28f499b175'},
        {nombre: 'nssssn', apellido: 'nssssa' }
    );
     //res.send('hola mundo');
     res.send('ok');

 });

//si el dato viene de un form. es app.post y pòner req.body

app.get('/agregar', async function ( req , res ) {
  var nuevoartista = await  ArtistaModel.create(
        {nombre: 'joe', apellido: 'no'}
    );
        res.send(nuevoartista);
});


//borrado fisico
/*app.get('/borrar', async function ( req , res ) {
 var rta = await  ArtistaModel.findOneAndRemove(
          {_id:'5e5709243399ba28f499b174' }
      );
          res.send(rta);
  });*/




//1) renderiza el formulario de hbs
  app.get('/alta', function (req, res){
      res.render('formulario');
  });


//2)al form del hbs le digo que el method sea post //EL REDIRECT ES UN GET A /LISTADO
  app.post('/alta', async function (req, res){
   
   if (req.body.nombre =='' || req.body.apellido ==''){
        res.render('formulario' , {
        error: 'el nombre es obligatorio',
        datos: {
        nombre: req.body.nombre,
        apellido: req.body.apellido
        }
        });

        return;
   }


//el return es para que se ejecute si o si lo de arriba

    await ArtistaModel.create({
     nombre: req.body.nombre,
     apellido: req.body.apellido
    });

    res.redirect('/listado');
});



//3) //.find trae todos los registros //pegunta si existe la sesion// por la  rta del estado
app.get('/listado', async function( req , res ) {
    /*if(!req.session.user_id){
        res.redirect('/login');
        return;
    }*/

    var abc = await ArtistaModel.find().lean();
     //res.send('hola mundo');
     res.render ('listado', {listado:abc} );
 });


//req.body cuando viene de un formulario y el params viene de un boton

 //4) para acceer a :id se pone req.params.id 
 app.get('/borrar/:id', async function ( req , res ) {
  await  ArtistaModel.findOneAndRemove(
             {_id:req.params.id }
         );
             //res.send(rta)
             res.redirect('/listado');
     });

//5) // value precarga emn el input el id que puse para editar
app.get('/editar/:id', async function (req, res){
   var artista =  await ArtistaModel.findById({_id: req.params.id}).lean();
    res.render('formulario',{datos:artista});
});

app.post('/editar/:id', async function( req, res) {

    if (req.body.nombre.length==0){
        res.render('formulario' , {
        error: 'el nombre es obligatorio',
        datos: {
        nombre: req.body.nombre,
        apellido: req.body.apellido
        }
        });

        return;
   }

await ArtistaModel.findByIdAndUpdate(
    {_id: req.params.id},
    {
        nombre: req.body.nombre,
        apellido: req.body.apellido
    }
);
res.redirect('/listado');
});



//si no esta definida la variable la  inicio en 0 por eso pòngo !

app.get('/contar', function (req , res ){
    if( !req.session.contador ){
        req.session.contador = 0 ;

    }
    
    req.session.contador ++; 
    res.json(req.session.contador);
    
    
});


//log in 



const UsuarioSchema = mongoose.Schema ({

    username: String,
    password: String,
    email: String

})


const UsuarioModel = mongoose.model('Usuario', UsuarioSchema);



app.get('/login', function(req,res) {
    res.render('login');
});




//devuelve un array el find (query)

app.post('/login', async function(req,res) {
const user = await UsuarioModel.find({

username:req.body.user, 
password: req.body.pass});

/*res.send(user);
return;*/
console.log(user);

if (user.length!=0){
    req.session.user_id = user[0] ._id;
    res.redirect('/listado');
} else {
    res.send('mal');
}
 
});


app.get ('/api/artistas', async function ( req , res ) {
var listado= await ArtistaModel.find().lean();
res.json(listado);
});

app.get ('/api/artistas/:id', async function ( req , res ) {
    try {
    var unartista = await ArtistaModel.findById(req.params.id); 
    res.json(unartista);
    } catch (e) {
    res.status(404).send('error');

}

    });
    


app.post('/api/artistas', async function( req , res ) {
    var artista = await ArtistaModel.create ({
        nombre:req.body.nombre,
        apellido:req.body.apellido
    });
    res.json(artista);

});

app.put('/api/artistas' , async function ( req , res ){

    try {
    await artistaModel.findByIdAndUpdate (
        req.params.id,
        {
            nombre:req.body.nombre,
            apellido:req.body.apellido
        });
        res.status(200).send('ok');
    }catch(e){

        res.status(404).send('error');
    }
});


app.delete ('/api/artistas', async function ( req , res ) {

    try {
    await ArtistaModel.findByIdAndDelete(req.params.id)
        res.status(204).send();

    } catch (e) {
        res.status(404).send('no encontrado');
    }
    });


// asignar algo en la sesion// solo se ejecuta si el find retorna algo
//en la sesion guardo la variabñle user id que me lo trae de lo que ingreso
//me dice en cualquier pag cual es el id quie esta logueado

/*app.post('/login', function(req,res) {

    if (req.body.user == 'admin' && req.body.pass == 123 ){
        res.send('ok');
        
     
        } else {
        res.send('error');
   }

});*/



app.get('/signin', function (req, res){
    res.render('signin_form');
});



app.post('/signin',  async function (req, res){
    
    if (req.body.usuario.length =='' || req.body.contrasenia.length ==''){
        res.render('signin_form' , {
        error: 'el nombre es obligatorio',
        datos: req.body
        
           });

        return;
   }


//el return es para que se ejecute si o si lo de arriba

    await UsuarioModel.create({
    username: req.body.usuario,
    password: req.body.contrasenia,
    email:req.body.email
    });

    res.redirect('/login');
});





//el send no puede mandar un numero directo por eso se usa res.json (/codigo de estado ej: 404 error) porque no sabe si es coigo de estado
//cada sesion es por navegador 



app.listen(80, function() {
console.log('desde el localhost');

});

