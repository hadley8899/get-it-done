<?php

namespace App\Exceptions;

class KnowledgebaseException extends CustomBaseException
{
    /**
     * @return KnowledgebaseException
     */
    public static function knowledgebaseDoesNotBelongToCategory(): KnowledgebaseException
    {
        return new self('Knowledgebase does not belong to category', ['knowledgebase' => trans('knowledgebase.knowledgebase_does_not_belong_to_category')]);
    }

    public static function knowledgebaseDoesNotBelongToWorkspace() :KnowledgebaseException
    {
        return new self('Knowledgebase does not belong to workspace', ['knowledgebase' => trans('knowledgebase.knowledgebase_does_not_belong_to_workspace')]);
    }
}
