import os
from nltk.tokenize import sent_tokenize

## get a list of files from a directory
def get_filelist(mypath):
    _, _, filenames = next(os.walk(mypath))
    return filenames

def read_article(file_name):
    file = open(file_name, "r")
    filedata = file.read()
    file.close()
    #rm_input(file_name)
    sentences = sent_tokenize(filedata)
    return sentences

def rm_input(file_name):
    os.remove(file_name)
    return True

def save_summary(summary, file_name):
    file = open(file_name, "a")
    file.write("\n".join(summary))
    file.close()
