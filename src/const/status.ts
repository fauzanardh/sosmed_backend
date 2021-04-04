export const api_error_code = {
    unknown_error: -1,
    no_error: 0,
    no_params: 1,
    sql_error: 2,
    redis_error: 3,
    http_error: 4,
};

export const postgres_error_codes = {
    "08003": "connection_does_not_exist",
    "08006": "connection_failure",
    "2F002": "modifying_sql_data_not_permitted",
    "57P03": "cannot_connect_now",
    "42601": "syntax_error",
    "42501": "insufficient_privilege",
    "42602": "invalid_name",
    "42622": "name_too_long",
    "42939": "reserved_name",
    "42703": "undefined_column",
    "42000": "syntax_error_or_access_rule_violation",
    "42P01": "undefined_table",
    "42P02": "undefined_parameter"
}

export const http_status = {
    success: 200,
    error: 500,
    not_found: 404,
    unauthorized: 401,
    conflict: 409,
    created: 201,
    bad: 400,
    no_content: 204,
};

export default {
    api_error_code,
    postgres_error_codes,
    http_status
}
