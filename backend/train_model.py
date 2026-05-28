"""
Run this script FIRST to train the ML model on your PhiUSIIL dataset.

Usage:
    python train_model.py
    python train_model.py --dataset "D:\\ml project datasets\\phishing\\PhiUSIIL_Phishing_URL_Dataset.csv"
"""

import sys
import argparse
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.ml.model_trainer import train_model
from app.config import settings
from app.utils.logger import logger


def main():
    parser = argparse.ArgumentParser(description="Train phishing detection ML model")
    parser.add_argument(
        "--dataset",
        type=str,
        default=settings.DATASET_PATH,
        help="Path to PhiUSIIL CSV dataset",
    )
    args = parser.parse_args()

    logger.info("=" * 60)
    logger.info("PhishGuard AI — Model Training")
    logger.info("=" * 60)
    logger.info(f"Dataset: {args.dataset}")

    try:
        metrics = train_model(args.dataset)
        logger.info("=" * 60)
        logger.info("TRAINING COMPLETE")
        logger.info(f"  Accuracy  : {metrics['accuracy']:.4f}")
        logger.info(f"  Precision : {metrics['precision']:.4f}")
        logger.info(f"  Recall    : {metrics['recall']:.4f}")
        logger.info(f"  F1 Score  : {metrics['f1_score']:.4f}")
        logger.info(f"  ROC-AUC   : {metrics['roc_auc']:.4f}")
        logger.info("=" * 60)
        logger.info("Model saved. You can now start the server with: python run.py")
    except FileNotFoundError:
        logger.error(f"Dataset not found at: {args.dataset}")
        logger.error("Update DATASET_PATH in app/config.py or pass --dataset flag")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Training failed: {e}")
        raise


if __name__ == "__main__":
    main()
