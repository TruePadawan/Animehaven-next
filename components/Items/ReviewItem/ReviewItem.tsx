import {
    Box,
    Grid,
    IconButton,
    Modal,
    Rating,
    Skeleton,
    Typography,
} from "@mui/material";
import {Fragment, useEffect, useState} from "react";
import {getAnimeByID} from "../../../utilities/mal-api";
import {getUsefulData} from "../../../utilities/app-utilities";
import Link from "next/link";
import VisibilityIcon from "@mui/icons-material/Visibility";
import styles from "./style.module.css";
import {useSupabaseClient} from "@supabase/auth-helpers-react";
import {Database} from "../../../database.types";
import {AnimeItemData} from "../../../utilities/global.types";

interface ReviewItemProps {
    itemId: string;
    creatorId: string;
    index: number;
}

interface ReviewItemData {
    rating: number;
    review: string;
    title: string;
    imageURL: string;
}

export default function ReviewItem({itemId, creatorId, index}: ReviewItemProps) {
    const supabase = useSupabaseClient<Database>();
    const [loading, setLoading] = useState(true);
    const [itemData, setItemData] = useState<ReviewItemData>({imageURL: "", rating: 0, review: "", title: ""});
    const [modalOpen, setModalOpen] = useState(false);

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    useEffect(() => {
        // LAZY REQEUST DUE TO RATE LIMITING
        const timeout = index > 0 ? index * 700 : 0;
        setTimeout(() => {
            supabase
                .from("item_reviews")
                .select("rating,review")
                .eq("item_id", itemId)
                .eq("creator_id", creatorId)
                .limit(1)
                .single()
                .then((result) => {
                    if (result.error) {
                        // TODO: trigger an error notification
                        return;
                    }
                    const {rating, review} = result.data;
                    // TODO: this 'any' should be replaced with a proper type when jikan-ts is added to the project
                    getAnimeByID(itemId).then((rawData: any) => {
                        const {title, imageURL}: AnimeItemData = getUsefulData(rawData);
                        setItemData({
                            rating,
                            review,
                            title,
                            imageURL,
                        });
                        setLoading(false);
                    });
                });
        }, timeout);
    }, [creatorId, itemId, index]);

    return (
        <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
            <div className={styles.item}>
                {loading && (
                    <Fragment>
                        <Skeleton variant="rounded" width={90} height={100}/>
                        <div
                            className={`d-flex flex-column justify-content-between flex-grow-1`}>
                            <Skeleton sx={{fontSize: "1rem", width: "90%"}}/>
                            <Rating
                                name="item-rating"
                                readOnly
                                value={5}
                                sx={{marginLeft: "auto"}}
                                size="small"
                            />
                        </div>
                    </Fragment>
                )}
                {!loading && (
                    <Fragment>
                        <img
                            src={itemData.imageURL}
                            alt={itemData.title}
                            width={90}
                            height={100}
                            loading="lazy"
                        />
                        <div className={`d-flex flex-column flex-grow-1`}>
                            <div className="d-flex justify-content-between flex-wrap">
                                <Link
                                    href={`/anime/${itemId}`}
                                    className={styles.itemTitle}
                                    title={itemData.title}>
                                    {itemData.title}
                                </Link>
                                <IconButton sx={{padding: "0"}} onClick={openModal}>
                                    <VisibilityIcon/>
                                </IconButton>
                            </div>
                            <Rating
                                name="item-rating"
                                readOnly
                                value={itemData.rating}
                                sx={{marginLeft: "auto", marginTop: "auto"}}
                                size="small"
                            />
                        </div>
                        <Modal
                            open={modalOpen}
                            onClose={closeModal}
                            aria-labelledby="modal-title">
                            <Box className={styles.review}>
                                <Typography id="modal-title" variant="h6" component="h2">
                                    Review
                                </Typography>
                                <Typography sx={{mt: 2, whiteSpace: "pre-line"}}>
                                    {itemData.review}
                                </Typography>
                            </Box>
                        </Modal>
                    </Fragment>
                )}
            </div>
        </Grid>
    );
}
