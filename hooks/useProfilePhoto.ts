import { SessionWithUser } from "@/interfaces/session";
import { getProfilePhoto } from "@/utils/azureAD";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const useProfilePhoto = () => {
  const { data: session } = useSession() as SessionWithUser;
  const [image, setImage] = useState<string | null>(null);
  const defaultAvatarUrl = '/profile-default.webp';

  useEffect(() => {
    if(session){
      if(session?.provider === 'azure-ad') {
        if (!session?.accessToken) return;
  
        (async () => {
            try {
                const photo = await getProfilePhoto(session?.accessToken);
                setImage(photo || defaultAvatarUrl);
            } catch (error) {
                console.error("Error al obtener la imagen del perfil:", error);
                setImage(defaultAvatarUrl);
            }
        })();
      }else{
        setImage(defaultAvatarUrl);
      }
    }
  }, [session]);

  return image;
}

export default useProfilePhoto