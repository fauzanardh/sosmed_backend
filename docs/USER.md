**Get Users**
----
Get all users from the database. You can change the amount of returned data by using the params `limit` and use the param `page` to offset the data.

* **URL**

  `/api/v1/user`

* **Method:**

  `GET`

*  **URL Params**

   **Optional:**
   
   `limit=[integer]`
   
    Limit the amount of returned data from the server, the default is 25, and the maximum is 100.

    `page=[integer]`

    Offset the returned data by `page * limit` amount.

* **Success Response:**

  * **Code:** 200 <br />
      **Content:**
    ```json
    {
    "error_code": 0,
    "message": "Successfully getting the users.",
    "data": [
        {
            "uuid": "<uuid>",
            "name": "<name>",
            "username": "<username>",
            "bio": "<bio|nullable>",
            "profilePicturePath": "<bio|nullable>"
        },
        {
            "uuid": "<uuid2>",
            "name": "<name2>",
            "username": "<username2>",
            "bio": "<bio2|nullable>",
            "profilePicturePath": "<bio2|nullable>"
        }
      ]
    }
    ```

* **Error Response:**

    * **Code:** 500 <br />
      **Content:**
      ```json
      {
        "error_code": 1,
        "message": "Something went wrong.",
        "data": {
            "error_name": "<error_name>",
            "error_detail": "<postgres_error_code|error_detail|error_message|\"Unknown error\">"
        }
      }
      ```
