import { Review } from "@/components/Catalogos/About/CommentPage";
import { AppState } from "@/context/InitialStatus";

export function ReordenateData(data: Review[], store: AppState) {
  return data.map((obj) => ({
    ...obj,
    reply: false,
    user: {
      ...obj.user,
      image: obj.user_id === store.Editor ? store?.urlPoster : obj.user.image,
      name:
        obj.user_id === store.Editor
          ? store?.name || "Anonymous"
          : obj.user.name,
    },
    replies: (obj.replies || obj.replies_coment || []).map((rep: Review) => ({
      ...rep,
      reply: true,
      user: {
        ...rep.user,
        image: rep.user_id === store.Editor ? store?.urlPoster : rep.user.image,
        name:
          rep.user_id === store.Editor
            ? store?.name || "Anonymous"
            : rep.user.name,
      },
    })),
  }));
}
