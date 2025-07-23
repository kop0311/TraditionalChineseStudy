// @generated automatically by Diesel CLI.

diesel::table! {
    users (id) {
        id -> Uuid,
        email -> Varchar,
        password_hash -> Varchar,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
    }
}

diesel::table! {
    hanzi (id) {
        id -> Int4,
        character -> Varchar,
        pinyin -> Varchar,
        meaning -> Text,
        stroke_count -> Int4,
        level -> Int4,
        created_at -> Timestamptz,
    }
}

diesel::table! {
    comments (id) {
        id -> Int4,
        text -> Text,
        user_id -> Uuid,
        created_at -> Timestamptz,
    }
}

diesel::joinable!(comments -> users (user_id));

diesel::allow_tables_to_appear_in_same_query!(
    users,
    hanzi,
    comments,
);
