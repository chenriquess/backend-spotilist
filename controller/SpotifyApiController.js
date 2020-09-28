const express = require('express');
const router = express.Router()
const SpotifyWebApi = require("spotify-web-api-node");


const tokenVerification = async (req, res, next) => {
  spotifyApi.getMe().then(userInfo => {
    if (userInfo.body.id) {
      req.userId = userInfo.body.id;
      next();
    } else {
      res.status(401).json({erro: `Usuário não encontrado`});
    }
  }).catch(e => {
    if (e.statusCode === 401) {
      res.redirect('/login')
    } else {
      res.send(e)
    }
  });
};


const scopes = ['user-read-private', 'user-read-email', 'playlist-modify-public', 'playlist-modify-private'],
  redirectUri = 'http://localhost:5000/spotify/callback',
  clientId = '716c91137a1a4c6d941e4f7a19719b80',
  state = 'some-state-of-my-choice';

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
const spotifyApi = new SpotifyWebApi({
  redirectUri: redirectUri,
  clientId: clientId,
  clientSecret: '2ca22dc7f6214ec9b9d879bfb1560fca'
});


router.use('/login', ((req, res) => {
// Create the authorization URL
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state, false);

  res.redirect(authorizeURL)

  console.log('URL de Autorizacao:', authorizeURL);
}));


router.use('/callback', ((req, res) => {
  console.log('CODE:', req.query.code);

  spotifyApi.authorizationCodeGrant(req.query.code).then(
    function (data) {
      console.log('The token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);
      console.log('The refresh token is ' + data.body['refresh_token']);

      // Set the access token on the API object to use it in later calls
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);

      res.send({
        auth: true,
      })
    },
    function (err) {
      console.log('Something went wrong!', err);
    }
  );


}));

router.get('/search', tokenVerification, (req, res) => {
  console.log('search')
  spotifyApi.search(req.query.q, ['track', 'artist']).then(result => {
    res.send(result.body.tracks.items.map(track => {
      return {
        id: track.id,
        title: track.name,
        artists: track.artists,
        album: track.album.name,
        popularity: track.popularity,
        albumImgUrl: track.album.images[0] ? track.album.images[0].url : ''
      }
    }));
  });
});

router.get('/playlists', tokenVerification, ((req, res) => {
  spotifyApi.getMe().then(userInfo => {
    spotifyApi.getUserPlaylists(userInfo.body.id).then(playlists => {

      res.send(
        JSON.stringify(playlists.body.items.map(item => {
          return {
            id: item.id,
            title: item.name,
            imgUrl: item.images[0] ? item.images[0].url : ''
          }
        }))
      );

    })
  }).catch(e => {
    if (e.statusCode === 401) {
      res.redirect('/login')
    } else {
      res.send(e)
    }
  })
  ;
}));

router.post('/playlist', tokenVerification, (req, res) => {
  spotifyApi.createPlaylist(req.userId, req.body.title)
    .then(value => res.send(value))
    .catch(e => res.send(e));
});

module.exports = router;