# structured

Function extraction from docs.

## Stack

- [Together.ai](https://together.ai/) for fine-tuning + inference.

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

4. To grab the related documentations that we are interested in, 

```bash
git clone https://github.com/unknownue/PyTorch.docs.git
```

which contains offline docs for pytorch, numpy, etc.