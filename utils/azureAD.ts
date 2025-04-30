import axios from "axios";

export async function getProfilePhoto(accessToken: string) {
  const response = await axios.get('https://graph.microsoft.com/v1.0/me/photos/48x48/$value', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    responseType: 'arraybuffer',
  });
  if (!response.data) {
    return null;
  }

  const base64Image = Buffer.from(response.data).toString('base64');
  return `data:image/jpeg;base64,${base64Image}`;
}

export async function refreshAccessToken(token: any) {
  const shouldRefresh = Date.now() > token.accessTokenExpires - 60 * 10000; // 10 minutos antes de expirar
  if(token.provider === 'azure-ad' && shouldRefresh) {

    try {
      const url =
        `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`;
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.AZURE_AD_CLIENT_ID!,
          client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
          grant_type: 'refresh_token',
          refresh_token: token.refreshToken,
          scope: 'openid profile email offline_access User.Read',
        }),
      });
  
      const refreshedTokens = await response.json();
  
      if (!response.ok) {
        throw refreshedTokens;
      }
  
      return {
        ...token,
        accessToken: refreshedTokens.access_token,
        accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
        refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Reemplazamos si hay uno nuevo, sino, mantenemos el viejo
      };
    } catch (error) {
      console.error('Error refreshing access token:', error);
      
      return {
        ...token,
        error: 'RefreshAccessTokenError',
      };
    }

  }
  
  return token;
}
