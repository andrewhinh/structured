# structured

An LLM for function extraction from Python docs.

## Stack

- [Together.ai](https://together.ai/) for fine-tuning + inference.
- [Poe](https://poe.com/) for front-end.

## Setup

1. Install conda if necessary:

    ```bash
    # Install conda: https://conda.io/projects/conda/en/latest/user-guide/install/index.html#regular-installation
    # If on Windows, install chocolately: https://chocolatey.org/install. Then, run:
    # choco install make
    ```

2. Create the conda environment locally:

    ```bash
    conda env update --prune -f environment.yml
    conda activate structured
    pip install -r requirements.txt
    export PYTHONPATH=.
    echo "export PYTHONPATH=.:$PYTHONPATH" >> ~/.bashrc (or ~/.zshrc)
    # If on Windows, the last two lines probably won't work. Check out this guide for more info: https://datatofish.com/add-python-to-windows-path/
    ```

3. Create a `.env` file using `.env.template` as a reference and export the variables:

    ```bash
    export $(cat .env | xargs)
    ```

## Fine-tuning

Grab the relevant documentations which contains offline docs for pytorch, numpy, etc.:

```bash
git clone https://github.com/unknownue/PyTorch.docs.git
```

1. Create the dataset:

    ```bash
    make create-dataset
    # Resulting file: data.jsonl
    ```

2. Upload the dataset to Together.ai:

    ```bash
    together files upload data.jsonl
    # Resulting file ID: <FILE-ID>
    ```

3. Fine-tune the model:

    ```bash
    together finetune create -t <FILE-ID> --suffix 1.0 -m togethercomputer/llama-2-7b-chat 
    # Hyperparameters: https://docs.together.ai/docs/python-fine-tuning
    # Models: https://docs.together.ai/docs/models-fine-tuning
    # Resulting fine-tuning ID: <FT-ID>
    ```

4. Monitor progress [here](https://api.together.xyz/playground/finetuning) or in the CLI:

    ```bash
    # Get current and past fine-tune jobs
    together finetune list

    # Monitor fine-tune job events such as training-start, epoch-completed, job-completed, etc.
    together finetune list-events <FT-ID>

    # Retrieve job details and hyper-parameters
    together finetune retrieve <FT-ID>

    # Cancel a running job with
    together finetune cancel <FT-ID>
    ```

## Deploying

1. Go to the "Models" tab [here](https://api.together.xyz/playground) and click the "Run" button for the model to get an API URL.

2. Go [here](https://poe.com/create_bot) and enter the API URL. Make sure to save the API Key.
