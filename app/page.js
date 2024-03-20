"use client";

import { useState, useEffect } from "react";
import initFacebookSDK from "./initFacebookSDK.js";

export default function Home() {
  const [imageUrl, setImageUrl] = useState("");
  const [postCaption, setPostCaption] = useState("");
  const [isSharingPost, setIsSharingPost] = useState(false);
  const [facebookUserAccessToken, setFacebookUserAccessToken] = useState("");

  /* --------------------------------------------------------
   *                      FACEBOOK LOGIN
   * --------------------------------------------------------
   */

  const initializeData = async () => {
    await initFacebookSDK();
    window.FB.getLoginStatus((response) => {
      setFacebookUserAccessToken(response.authResponse?.accessToken);
    });
  }

  // Check if the user is authenticated with Facebook
  useEffect(() => {
    initializeData();
  }, []);

  const logInToFB = () => {
    window.FB.login(
      (response) => {
        setFacebookUserAccessToken(response.authResponse?.accessToken);
      },
      {
        // Scopes that allow us to publish content to Instagram
        scope: "instagram_basic,pages_show_list",
      }
    );
  };

  const logOutOfFB = () => {
    window.FB.logout(() => {
      setFacebookUserAccessToken(undefined);
    });
  };

  /* --------------------------------------------------------
   *             INSTAGRAM AND FACEBOOK GRAPH APIs
   * --------------------------------------------------------
   */

  const getFacebookPages = () => {
    return new Promise((resolve) => {
      window.FB.api(
        "me/accounts",
        { access_token: facebookUserAccessToken },
        (response) => {
          resolve(response.data);
        }
      );
    });
  };

  const getInstagramAccountId = (facebookPageId) => {
    return new Promise((resolve) => {
      window.FB.api(
        facebookPageId,
        {
          access_token: facebookUserAccessToken,
          fields: "instagram_business_account",
        },
        (response) => {
          resolve(response.instagram_business_account.id);
        }
      );
    });
  };

  const createMediaObjectContainer = (instagramAccountId) => {
    return new Promise((resolve) => {
      window.FB.api(
        `${instagramAccountId}/media`,
        "POST",
        {
          access_token: facebookUserAccessToken,
          image_url: imageUrl,
          caption: postCaption,
        },
        (response) => {
          resolve(response.id);
        }
      );
    });
  };

  const publishMediaObjectContainer = (
    instagramAccountId,
    mediaObjectContainerId
  ) => {
    return new Promise((resolve) => {
      window.FB.api(
        `${instagramAccountId}/media_publish`,
        "POST",
        {
          access_token: facebookUserAccessToken,
          creation_id: mediaObjectContainerId,
        },
        (response) => {
          resolve(response.id);
        }
      );
    });
  };

  const shareInstagramPost = async () => {
    setIsSharingPost(true);
    const facebookPages = await getFacebookPages();
    const instagramAccountId = await getInstagramAccountId(facebookPages[0].id);
    const mediaObjectContainerId = await createMediaObjectContainer(
      instagramAccountId
    );

    await publishMediaObjectContainer(
      instagramAccountId,
      mediaObjectContainerId
    );

    setIsSharingPost(false);

    // Reset the form state
    setImageUrl("");
    setPostCaption("");
  };

  return (
      <main className="flex w-full h-[100vh] justify-center items-center">
        <section className="flex flex-col w-full justify-center items-center">
          {
            facebookUserAccessToken ? 
             (
              <section className="flex flex-col w-[80vh] gap-y-4">
                <h3 className="font-bold p-3">Create your insta post!</h3>
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter a JPEG image url..."
                />
                <textarea
                  value={postCaption}
                  onChange={(e) => setPostCaption(e.target.value)}
                  placeholder="Write a caption..."
                  rows="10"
                />
                <button
                  onClick={shareInstagramPost}
                  className="btn action-btn"
                  disabled={isSharingPost || !imageUrl}
                >
                  {isSharingPost ? "Posting..." : "Post"}
                </button>
                <button onClick={logOutOfFB} className="btn action-btn">
                  Log Out
                </button>
              </section>
             ) : 
             (
              <>
                <h3 className=" my-5"> Log In</h3>
                <button onClick={logInToFB} className="btn action-btn">
                  Log In
                </button>
              </>
             )
          }
        </section>
      </main>
  );
}
