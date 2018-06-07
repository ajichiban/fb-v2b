
	$('#login-form-link').click(function (e) {
		$("#login-form").delay(100).fadeIn(100);
		$("#register-form").fadeOut(100);
		$('#register-form-link').removeClass('active');
		$(this).addClass('active');
		e.preventDefault();
	});
	$('#register-form-link').click(function (e) {
		$("#register-form").delay(100).fadeIn(100);
		$("#login-form").fadeOut(100);
		$('#login-form-link').removeClass('active');
		$(this).addClass('active');
		e.preventDefault();
	});

	$('.fbLogo').click(fbLogin);

	var sendEmail = function () {
		var user = firebase.auth().currentUser;

		user.sendEmailVerification()
			.then(function () {
				console.log('El correo se envió');
			}, function (error) {
				console.log(error)
			})
	}

	//Create User
	var createUser = function () {
		var email = $('#email-new').val();
		var password = $('#password-new').val();

		firebase.auth().createUserWithEmailAndPassword(email, password)
			.then(function (data) {
				console.log(data)
				sendEmail();
			})
			.catch(function (error) {
				console.log(error)
			})
		getUser();
		return false;
	}

	//Get User
	var getUser = function () {
		firebase.auth().onAuthStateChanged(function (user) {
			if (user) {
				$('.saludo').html('Tu usuario es: <b>' + user.email + '</b>')
				$('#access').hide();
				$('#logged').show();
			} else {
				$('#access').show();
				$('#logged').hide();
			}
		})
	}

	getUser();

	var login = function () {
		var email = $('#email').val();
		var password = $('#password').val();

		firebase.auth().signInWithEmailAndPassword(email, password)
			.catch(function (error) {
				console.log(error)
			})
	}

	var logout = function () {
		firebase.auth().signOut()
			.then(function () {
				console.log('Ya terminó la sesión')
			}, function (error) {
				console.log(error);
			})
	}

	var recoverPass = function () {
		var auth = firebase.auth();
		var emailAddress = $('#email').val();

		auth.sendPasswordResetEmail(emailAddress)
			.then(function () {
				alert('Se ha enviado un correo a su cuenta. Por favor sigue los pasos indicados.');
			}, function (error) {
				console.log(error)
			})
	}

	var fbLogin = function () {
		//Facebook login actions...

		var provider = new firebase.auth.FacebookAuthProvider();
		firebase.auth().signInWithPopup(provider)
			.then(function (result) {
				console.log(result)
			}, function (error) {
				console.log(error)
			})
	}

	/***************************/
	//*** DATABASE SECTION ***//
	/***************************/


	
	// Database service reference
	var db = firebase.database().ref('player/');

	/* escucha cualquier cambio que halla en la 
	base de datos y aplica los cambios */
	db.on('value', function(snapshot){
		var players = snapshot.val()
		$('#playersTable tbody').empty();

		var row ='';
		for (player in players)
		{
			row += `
			<tr id="${player}">
				<td class="name">${players[player].name}</td>
				<td class="mail">${players[player].mail}</td>
				<td class="number">${players[player].number}</td>
				<td class="position">${players[player].position}</td>
				<td><div class="btnEdit btn btn-warning glyphicon glyphicon-edit"></div></td>
				<td><div class="btnDelete btn btn-danger glyphicon glyphicon-remove"></div></td>
			</tr>
			`
		}
		$('#playersTable tbody').append(row);
		row = '';


		$('.btnDelete').click(function(){
			let playerId = $(this).closest('tr').attr('id');

			// indico  a la base  de datos que voy a eliminar una registro
			db.child(playerId).remove();
		})
		// agregando  el  evento de editar
		$('.btnEdit').click(function(){

			// obteniendo el id de player a editar
			var playerId = $(this).closest('tr').attr('id')

			// llenando los campos del fomulario con los datos del player a editar
			$('#name').val($('#'+ playerId).find('.name').text());
			$('#mail').val($('#'+ playerId).find('.mail').text());
			$('#number').val($('#'+ playerId).find('.number').text());
			$('#position').val($('#'+ playerId).find('.position').text());

			// Cambiar  el  boton de "enviar" a  "actualizar".
			$('#btnSend').text('Actualizar')
			.removeClass('btn-primary')
			.addClass('btn-success')
			.unbind('click')
			.click(function(){

				//le indico a la base de datos que deseo actualizar
				db.child(playerId).update({
					name : $('#name').val(),
					mail: $('#mail').val(),
					number: $('#number').val(),
					position: $('#position option:selected').text()
					},
					 function(){
						$('#name').val('');
						$('#mail').val('');
						$('#number').val('');
						$('#position').val('');

						// cambiar de  nuevo  el boton de actualizar a enviar
						$('#btnSend').text('Enviar')
						.removeClass('btn-success')
						.addClass('btn-primary')
						.click(savePlayer)
					 })	
				})

			})
	}, function(errorObject){
		console.log('the read failed: ', errorObject);
		
	})

	//Get players
	/*  Genera un nuevo registro en nuestra  base de datos en tiempo real */
	function savePlayer()
	{
		let playerNumber = $('#number').val();
		let dataPlayer = {
			name : $('#name').val(),
			mail: $('#mail').val(),
			number: playerNumber,
			position: $('#position option:selected').text()
		}

		/* Validando que no halla registro con el mismo numero */
		db.orderByChild('number')
			.equalTo(playerNumber)
			.once('value', function(snapshot){
				if(snapshot.hasChildren()){
					$('#myModal').modal('show');
				}else{
					//agrego a el player  en la  base de  datos.
					db.push().set(dataPlayer, function(error){
						if(error){
							console.log(error,' fallo');
						}else{
							console.log(error,' exito');
						}
					})
				}
			})
		
	}
	$('#btnSend').click(savePlayer)

	/* Trabajar online offline*/
	/* firebase.database().goOffline()
	   firebase.database().goOffline()*/
