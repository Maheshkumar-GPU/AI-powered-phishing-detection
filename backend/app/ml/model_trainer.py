import pandas as pd
import numpy as np
import joblib
import os
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, classification_report, confusion_matrix
)
from app.ml.feature_extractor import extract_features, features_to_vector
from app.config import settings
from app.utils.logger import logger


def load_and_prepare_dataset(dataset_path: str) -> tuple[np.ndarray, np.ndarray, list[str]]:
    logger.info(f"Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)
    logger.info(f"Dataset loaded. Shape: {df.shape}")
    logger.info(f"Columns: {df.columns.tolist()}")

    if "label" in df.columns:
        label_col = "label"
    elif "Label" in df.columns:
        label_col = "Label"
    elif "phishing" in df.columns:
        label_col = "phishing"
    elif "class" in df.columns:
        label_col = "class"
    else:
        raise ValueError(f"Cannot find label column in: {df.columns.tolist()}")

    if "URL" in df.columns:
        url_col = "URL"
    elif "url" in df.columns:
        url_col = "url"
    else:
        raise ValueError(f"Cannot find URL column in: {df.columns.tolist()}")

    df = df.dropna(subset=[url_col, label_col])
    df[label_col] = pd.to_numeric(df[label_col], errors="coerce")
    df = df.dropna(subset=[label_col])

    logger.info(f"After cleaning. Shape: {df.shape}")
    logger.info(f"Label distribution:\n{df[label_col].value_counts()}")

    feature_names = [
        "url_length", "domain_length", "is_https", "subdomain_count",
        "has_ip_address", "has_at_symbol", "dash_count", "dot_count",
        "has_suspicious_keywords", "entropy", "special_char_count",
        "digit_count_in_hostname", "query_param_count", "has_port",
        "has_uncommon_tld", "double_slash_redirect", "url_similarity_index",
        "char_continuation_rate", "tld_length",
    ]

    logger.info("Extracting features from URLs...")
    X_list = []
    y_list = []
    errors = 0

    for idx, row in df.iterrows():
        try:
            url = str(row[url_col]).strip()
            if not url.startswith(("http://", "https://")):
                url = "http://" + url
            features = extract_features(url)
            vector = features_to_vector(features)
            X_list.append(vector)
            y_list.append(int(row[label_col]))
        except Exception as e:
            errors += 1
            if errors <= 5:
                logger.warning(f"Error processing URL at index {idx}: {e}")

    logger.info(f"Feature extraction complete. Valid: {len(X_list)}, Errors: {errors}")
    return np.array(X_list), np.array(y_list), feature_names


def train_model(dataset_path: str | None = None) -> dict:
    if dataset_path is None:
        dataset_path = settings.DATASET_PATH

    X, y, feature_names = load_and_prepare_dataset(dataset_path)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    logger.info(f"Train size: {X_train.shape[0]}, Test size: {X_test.shape[0]}")

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    logger.info("Training RandomForestClassifier...")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)
    y_prob = model.predict_proba(X_test_scaled)[:, 1]

    metrics = {
        "accuracy": round(accuracy_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred, zero_division=0), 4),
        "recall": round(recall_score(y_test, y_pred, zero_division=0), 4),
        "f1_score": round(f1_score(y_test, y_pred, zero_division=0), 4),
        "roc_auc": round(roc_auc_score(y_test, y_prob), 4),
        "train_samples": int(X_train.shape[0]),
        "test_samples": int(X_test.shape[0]),
    }

    logger.info("=== MODEL PERFORMANCE ===")
    for k, v in metrics.items():
        logger.info(f"  {k}: {v}")
    logger.info("\n" + classification_report(y_test, y_pred, target_names=["Phishing", "Legitimate"]))

    importances = model.feature_importances_
    feature_importance = sorted(
        zip(feature_names, importances), key=lambda x: x[1], reverse=True
    )
    logger.info("Top 5 Feature Importances:")
    for name, imp in feature_importance[:5]:
        logger.info(f"  {name}: {imp:.4f}")

    os.makedirs(os.path.dirname(settings.MODEL_PATH), exist_ok=True)
    joblib.dump(model, settings.MODEL_PATH)
    joblib.dump(scaler, settings.SCALER_PATH)
    logger.info(f"Model saved to: {settings.MODEL_PATH}")
    logger.info(f"Scaler saved to: {settings.SCALER_PATH}")

    metrics["feature_importance"] = [
        {"feature": name, "importance": round(float(imp), 4)}
        for name, imp in feature_importance
    ]
    return metrics
