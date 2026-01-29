import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { ADD_POST } from "../../utils/mutations";
import Auth from "../../utils/auth";
import { Link } from "react-router-dom";
import { useOrganization } from "../../contexts/OrganizationContext";

const PostForm = () => {
  const { currentOrganization } = useOrganization();
  const userId = Auth.getProfile()?.data?._id;
  const [clientError, setClientError] = useState("");
  const [serverError, setServerError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const [addPost] = useMutation(ADD_POST);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const postText = event.target.elements.postText?.value.trim();
    if (!postText) {
      setClientError("Post cannot be empty.");
      setTimeout(() => setClientError(""), 3000);
      return;
    }

    if (!currentOrganization) {
      setClientError("No organization selected.");
      setTimeout(() => setClientError(""), 3000);
      return;
    }

    setClientError("");
    setServerError("");
    setIsPending(true);

    try {
      await addPost({
        variables: { 
          profileId: userId, 
          postText,
          organizationId: currentOrganization._id
        },
      });
      event.target.reset();
    } catch (err) {
      setServerError(err.message || "Server error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="rounded-lg border bg-gray-50 dark:bg-gray-800 dark:border-gray-700 border-gray-200 shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 dark:text-white text-gray-900">Create Post</h3>
      {Auth.loggedIn() ? (
        <form onSubmit={handleSubmit} aria-busy={isPending} className="space-y-3">
          <textarea
            name="postText"
            placeholder="What's on your mind?"
            disabled={isPending}
            aria-label="Post content"
            rows={3}
            className="w-full rounded-md border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={isPending}
            aria-label="Submit post"
            className="w-full rounded-md bg-blue-600 py-2 text-sm text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Posting…" : "Post"}
          </button>
          {(clientError || serverError) && (
            <div className="text-sm text-red-600 dark:text-red-400 px-3 py-2 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              {clientError || serverError}
            </div>
          )}
        </form>
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Please{" "}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Login
          </Link>{" "}
          or{" "}
          <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
            Signup
          </Link>{" "}
          to post.
        </p>
      )}
    </div>
  );
};

export default PostForm;


//  ############################# THIS CODE BELOW IS REACT 19  #############################

// import React, { useState } from "react";
// import { useMutation } from "@apollo/client";
// import { ADD_POST } from "../../utils/mutations";
// import { useActionState } from "react";
// import Auth from "../../utils/auth";
// import { Link } from "react-router-dom";

// const PostForm = () => {
//   const userId = Auth.getProfile()?.data?._id;
//   const [clientError, setClientError] = useState("");

//   const [addPost] = useMutation(ADD_POST);

//   const [serverError, formAction, isPending] = useActionState(
//     async (_, formData) => {
//       const postText = formData.get("postText");
//       if (!postText.trim()) return "Post cannot be empty.";
//       try {
//         await addPost({ variables: { profileId: userId, postText } });
//         return null;
//       } catch (err) {
//         return err.message || "Server error occurred.";
//       }
//     },
//     null
//   );

//   const handleEmptyCheck = (event) => {
//     const postText = event.target.elements.postText?.value || "";
//     if (!postText.trim()) {
//       event.preventDefault();
//       setClientError("Post cannot be empty.");
//       setTimeout(() => setClientError(""), 3000);
//     }
//   };

//   return (
//     <div>
//       <h4 className="text-2xl font-bold mb-2 ml-3">What's on your mind?</h4>
//       {Auth.loggedIn() ? (
//         <>
//           <form
//             action={formAction}
//             onSubmit={handleEmptyCheck}
//             aria-busy={isPending}
//             className="flex-row justify-center align-center"
//           >
//             <div className="col-12 col-lg-9">
//               <input
//                 name="postText"
//                 placeholder="What's on your mind?"
//                 disabled={isPending}
//                 className="mb-2 block w-full rounded-md border px-3 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-600 disabled:opacity-50"
//               />
//             </div>
//             <div className="col-12 col-lg-3">
//               <button
//                 type="submit"
//                 disabled={isPending}
//                 className="w-full rounded-md bg-indigo-600 mb-2 py-2 text-white font-semibold shadow-sm hover:bg-gray-600 disabled:opacity-50"
//               >
//                 {isPending ? "Posting…" : "Post Now"}
//               </button>
//             </div>
//             {(clientError || serverError) && (
//               <div className="col-12 my-3 bg-red-500 text-white italic p-3 rounded">
//                 {clientError || serverError}
//               </div>
//             )}
//           </form>
//         </>
//       ) : (
//         <p className="ml-3">
//           Please{" "}
//           <Link to="/login" className="underline text-blue-600">
//             Login
//           </Link>{" "}
//           or{" "}
//           <Link to="/signup" className="underline text-blue-600">
//             Signup
//           </Link>{" "}
//           to post.
//         </p>
//       )}
//     </div>
//   );
// };

// export default PostForm;
