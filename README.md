# github-search
Service to search for github users for a provided username and programming language. 
On running the docker file the the service will begin and the api docs are available at 

http://localhost:3000/api-docs/#/default

The rate limiting issue has not been handled,
On receiving partial responses the api returns both the success and failed responses with a incomplete_results flag.

When multiple languages are provided:
1) the api returns if users are available for first language
2) the second language is searched only if the previous language did not produce any users

Timeout error:
If a timeout occurs for get users api, the api goes on to search for the next language.
If only one language is provided the timeout response is returned. If the next language fails too then timeout respone is returnd

If no users are found for any languages specified then a success response is returned with empty users.

sample Get url: http://localhost:3000/v1/users?username=tom&language=nodejskdf,java&per_page=40&page=2
