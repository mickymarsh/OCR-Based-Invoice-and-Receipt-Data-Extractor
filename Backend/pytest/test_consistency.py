# pytest/test_receipts_invoices.py

from core.config import db

def test_receipt_user_consistency():
    """
    Integration Test: Ensure all receipts reference valid users and the sum of per-user receipts matches total receipts.
    
    """
    collection_name = "Receipt"
    all_docs = list(db.collection(collection_name).stream())
    total_docs = len(all_docs)

    user_doc_counts = {}

    for doc in all_docs:
        data = doc.to_dict()
        user_ref = data.get("user_id")

        # ✅ Check user_id exists
        assert user_ref is not None, f"{collection_name} {doc.id} has no user_id"

        # ✅ Check user_id references Users collection
        assert user_ref.path.startswith("Users/"), f"{collection_name} {doc.id} user_id does not reference Users collection"

        # ✅ Verify referenced user exists
        user_doc = user_ref.get()
        assert user_doc.exists, f"{collection_name} {doc.id} references non-existent user {user_ref.id}"

        # Count per-user receipts
        user_id = user_ref.id
        user_doc_counts[user_id] = user_doc_counts.get(user_id, 0) + 1

    # ✅ Sum of per-user receipts
    sum_user_docs = sum(user_doc_counts.values())

    # ✅ Assertion for consistency
    assert total_docs == sum_user_docs, (
        f"Mismatch in {collection_name}: total documents={total_docs}, "
        f"sum of per-user documents={sum_user_docs}"
    )


def test_invoice_user_consistency():
    """
    Integration Test: Ensure all invoices reference valid users and the sum of per-user invoices matches total invoices.
    """
    collection_name = "Invoice"
    all_docs = list(db.collection(collection_name).stream())
    total_docs = len(all_docs)

    user_doc_counts = {}

    for doc in all_docs:
        data = doc.to_dict()
        user_ref = data.get("user_id")

        # ✅ Check user_id exists
        assert user_ref is not None, f"{collection_name} {doc.id} has no user_id"

        # ✅ Check user_id references Users collection
        assert user_ref.path.startswith("Users/"), f"{collection_name} {doc.id} user_id does not reference Users collection"

        # ✅ Verify referenced user exists
        user_doc = user_ref.get()
        assert user_doc.exists, f"{collection_name} {doc.id} references non-existent user {user_ref.id}"

        # Count per-user invoices
        user_id = user_ref.id
        user_doc_counts[user_id] = user_doc_counts.get(user_id, 0) + 1

    # ✅ Sum of per-user invoices
    sum_user_docs = sum(user_doc_counts.values())

    # ✅ Assertion for consistency
    assert total_docs == sum_user_docs, (
        f"Mismatch in {collection_name}: total documents={total_docs}, "
        f"sum of per-user documents={sum_user_docs}"
    )
