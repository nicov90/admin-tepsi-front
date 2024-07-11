import Head from 'next/head';
import LoginUI from "@/components/login/LoginUI";

const LoginPage = async() => {
  // const session = await getServerSession(authOptions);
  const enableCustomLogin = process.env.ENABLE_CUSTOM_LOGIN === "true";

  return (
    <>
      <Head>
          <title>Iniciar sesión</title>
      </Head>
      <LoginUI enableCustomLogin={enableCustomLogin}/>
    </>
  );
};

export default LoginPage;
