import PropTypes from 'prop-types';
import styles from "./section.module.css";
import { IconButton } from '@mui/material';
import CachedIcon from '@mui/icons-material/Cached';

const Section = (props) => {
    const className = `${styles["section"]} ${props.className || ""}`;
    return (
        <section aria-labelledby={props.headingID} className={className}>
            <div className="d-flex justify-content-between align-items-center">
                <h2 id={props.headingID} className={styles["section-title"]}>{props.title}</h2>
                {props.refreshable && (
                    <IconButton aria-label="Refresh" onClick={props.onBtnClick} title="Refresh" sx={{ color: 'white' }}>
                        <CachedIcon />
                    </IconButton>
                )}
            </div>
            {props.children}
        </section>
    )
}

Section.propTypes = {
    title: PropTypes.string,
    className: PropTypes.string,
    headingID: PropTypes.string,
    onBtnClick: PropTypes.func,
    refreshable: PropTypes.bool
}

export default Section;