import {
	Box,
	Grid,
	IconButton,
	Modal,
	Rating,
	Skeleton,
	Typography,
} from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { getAnimeByID } from "../../../utilities/mal-api";
import { getUsefulData } from "../../../utilities/app-utilities";
import Link from "next/link";
import VisibilityIcon from "@mui/icons-material/Visibility";
import styles from "./style.module.css";
import { supabase } from "../../../supabase/config";
import Image from "next/image";

export default function ReviewItem({ itemID, creatorID, index }) {
	const [loading, setLoading] = useState(true);
	const [itemData, setItemData] = useState({});
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
				.eq("item_id", itemID)
				.eq("creator_id", creatorID)
				.limit(1)
				.throwOnError()
				.single()
				.then((dbQueryResult) => {
					const { rating, review } = dbQueryResult.data;
					getAnimeByID(itemID).then((rawData) => {
						const { title, imageURL } = getUsefulData(rawData);
						setItemData({
							rating,
							review,
							title,
							photoSrc: imageURL,
						});
						setLoading(false);
					});
				});
		}, timeout);
	}, [creatorID, itemID, index]);

	return (
		<Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
			<div className={styles.item}>
				{loading && (
					<Fragment>
						<Skeleton variant="rounded" width={90} height={100} />
						<div
							className={`d-flex flex-column justify-content-between flex-grow-1`}>
							<Skeleton sx={{ fontSize: "1rem", width: "90%" }} />
							<Rating
								name="item-rating"
								readOnly
								value={5}
								sx={{ marginLeft: "auto" }}
								size="small"
							/>
						</div>
					</Fragment>
				)}
				{!loading && (
					<Fragment>
						<img
							src={itemData.photoSrc}
							alt={itemData.title}
							width={90}
							height={100}
							loading="lazy"
						/>
						<div className={`d-flex flex-column flex-grow-1`}>
							<div className="d-flex justify-content-between flex-wrap">
								<Link
									href={`/anime/${itemID}`}
									className={styles.itemTitle}
									title={itemData.title}>
									{itemData.title}
								</Link>
								<IconButton sx={{ padding: "0" }} onClick={openModal}>
									<VisibilityIcon />
								</IconButton>
							</div>
							<Rating
								name="item-rating"
								readOnly
								value={itemData.rating}
								sx={{ marginLeft: "auto", marginTop: "auto" }}
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
								<Typography sx={{ mt: 2, whiteSpace: "pre-line" }}>
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
