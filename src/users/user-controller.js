const UserService = require('./user-service');
const UserError = require('../middlewares/exception');

require('dotenv').config();

class UserController {
    getKakaoToken = async (req, res) => {
        const { code } = req.query;
        console.log('전달받은 인가 코드 ::: ', code);
        if (!code) throw new UserError('인가코드가 존재하지 않습니다.', 400);

        const kakaoToken = await UserService.getKakaoToken(code);

        // 헤더 설정 : 필요한 부분인지 테스트 필요
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Content-Type', 'text/html; charset=utf-8');

        return res.send({ accessToken: kakaoToken });
    };

    /*
    1. 클라이언트에서 토큰 전달 받아서 카카오에 유저정보 요청
    2. DB의 유저정보와 비교하여 필요시 회원가입
    3. 유저정보 가공하여 클라이언트로 전달 => 쿠키로 토큰 전달 / 바디로 닉네임만 전달
    */
    getKakaoUserInfo = async (req, res) => {
        const { authorization } = req.headers;
        const [authType, kakaoToken] = (authorization || '').split(' ');

        if (!kakaoToken) throw new UserError('헤더에 토큰이 존재하지 않습니다.', 400);
        if (!authType || authType !== 'Bearer')
            throw new UserError('authorization 헤더 타입이 올바르지 않습니다.', 400);

        // 토큰 카카오에 보내고 유저정보 확인하여 회원가입/로그인 후 서버에서 발급한 accessToken 받아오기
        const { nickname, accessToken } = await UserService.getAccessToken(kakaoToken);
        console.log('유저컨트롤러 !!!!', nickname);
        console.log('유저컨트롤러 !!!!', accessToken);
        return res.status(200).send({ nickname: nickname, accessToken: accessToken });
    };
}

module.exports = new UserController();
