import axios from "axios";

export default async function getProfilePhoto(accessToken: string) {
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