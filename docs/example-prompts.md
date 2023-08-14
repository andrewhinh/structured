# Example Prompts

To use an LLM to generate examples to fine-tune our model.

## Prompts

Prompt 1:

```
please produce example test data in the form of <human> prompts and <bot> responses that we will use to fine-tune another large language model. please change the structure of the json each time. please use between 3 to 5 levels of depth and 3-5 high-level fields do not exceed 5 levels of depth with any json output. please otherwise use as much variance as possible regarding data types and from different industries and use cases, etc.

Here is an example output:

"""
<human>:
given this json, what is the full name?
{ "profile": { "first_name": "George", "last_name": "Hotz" }, score: 100 }
<bot>:
{ "full_name": "George Hotz" }
"""
```

Prompt 2:

```
please produce example test data in the form of <human> prompts and <bot> responses that we will use to fine-tune another large language model. please change the structure of the json each time. please use between 1 to 5 levels of depth and 1-5 high-level fields do not exceed 5 levels of depth with any json output. please otherwise use as much variance as possible regarding data types and from different industries and use cases, etc. please phrase questions so that they ask questions for which the output would be 1-3 high level fields and 1-3 levels of depth.

Here is an example output:

"""
<human>:
given this json, what is the full name?
{ "profile": { "first_name": "George", "last_name": "Hotz" }, score: 100 }
please reply with this format:
{ "profile": { "full_name": "<ANSWER>" } }
<bot>:
{ "profile": { "full_name": "George Hotz" } }
"""

Here is another one:

"""
<human>:
From the provided JSON, what's the model of the car?
{ "car": { "make": "Toyota", "model": "Corolla" }, "year": 2022 }
Please reply with this format:
{ "car": { "model_name": "<ANSWER>" } }
<bot>:
{ "car": { "model": "Corolla" } }
"""
```
